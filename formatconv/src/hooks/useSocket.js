import { onMounted, computed, watch } from "vue";
import { useStore } from "vuex";
import { getToken } from "../components/common/common";

export const useSocket = () => {
  const store = useStore();
  const interval = [];

  window.socket = null;

  // クライアントID設定
  const connectionId = computed(
    () => store.getters["fileUploadManager/getConnectionId"]
  );

  const idToken = computed(() => store.getters.idToken);

  // ログイン・ログアウトの場合、接続処理
  watch(idToken, async () => {
    if (idToken.value) {
      await socketConnect();
    } else if (
      window.socket &&
      window.socket.readyState == window.socket.OPEN
    ) {
      window.socket.close();
    }
  });

  // DynamoDBにデータ保管処理
  watch(connectionId, async () => {
    if (window.socket && window.socket.readyState === window.socket.OPEN) {
      window.socket.send(
        JSON.stringify({
          action: "store-connection-id",
          connectionId: connectionId.value,
        })
      );
    } else {
      await socketConnect();
    }
  });

  // ダウンロード処理
  const socketConnect = async () => {
    // トークンを取得
    const token = await getToken();
    window.socket = new WebSocket(
      `${import.meta.env.VITE_WEBSOKET_URL}?Authorization=${token}`
    );

    // ウェブソケットAPIと接続する
    window.socket.addEventListener("open", () => {
      if (connectionId.value) {
        window.socket.send(
          JSON.stringify({
            action: "store-connection-id",
            connectionId: connectionId.value,
          })
        );
      } else {
        window.socket.send("Start");
      }

      // アイドルにならないようにping処理実行(8分単位)
      const idle = setInterval(() => {
        if (window.socket.readyState === window.socket.OPEN) {
          window.socket.send(JSON.stringify({ type: "ping" }));
        }
      }, 60 * 8 * 1000);
      interval.push(idle);
    });

    // ダウンロードファイル準備環境後、ダウンロードURLを設定
    const eventList = {
      download: ({ file_name, download_url }) => {
        store.dispatch("fileUploadManager/updateFileItems", {
          id: file_name.split("/")[1].replace(/^output_/, ""),
          data: {
            download_url,
          },
        });
      },
    };

    // ウェブソケットAPIより送信されたメッセージを待つ
    window.socket.addEventListener("message", (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type && data) {
        eventList[type](data);
      }
    });

    // 例外エラーが発生する場合、ウェブソケットをクローズする
    window.socket.addEventListener("error", () => {
      window.socket.close();
    });

    // ウェブソケットクローズ後、再接続する処理
    window.socket.addEventListener("close", async () => {
      interval.forEach((item) => clearInterval(item));
      if (idToken.value) await socketConnect();
    });
  };
};
