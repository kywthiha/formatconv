import { onMounted, computed, watch } from "vue";
import { useStore } from "vuex";
import { getToken } from "../components/common/common";

export const useSocket = () => {
  const store = useStore();
  const interval = [];

  window.socket = null;

  const connectionId = computed(
    () => store.getters["fileUploadManager/getConnectionId"]
  );

  const idToken = computed(() => store.getters.idToken);

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

  watch(connectionId, async () => {
    if (window.socket && window.socket.readyState === window.socket.OPEN) {
      window.socket.send(
        JSON.stringify({
          action: "requestConnectionId",
          connectionId: connectionId.value,
        })
      );
    } else {
      await socketConnect();
    }
  });

  const socketConnect = async () => {
    // Create WebSocket connection.
    const token = await getToken();
    window.socket = new WebSocket(
      `wss://4m0y1f0f55.execute-api.us-east-1.amazonaws.com/production?Authorization=${token}`
    );

    // Connection opened
    window.socket.addEventListener("open", () => {
      if (connectionId.value) {
        window.socket.send(
          JSON.stringify({
            action: "requestConnectionId",
            connectionId: connectionId.value,
          })
        );
      } else {
        window.socket.send("Start");
      }

      // aws idle timeout 10 minutes
      const idle = setInterval(() => {
        if (window.socket.readyState === window.socket.OPEN) {
          window.socket.send(JSON.stringify({ type: "ping" }));
        }
      }, 60 * 8 * 1000);
      interval.push(idle);
      // socket.send(JSON.stringify({ action: "requestConnectionId" }));
    });

    const eventList = {
      download: ({ file_name, download_url }) => {
        store.dispatch("fileUploadManager/updateFileItems", {
          id: file_name.split("/")[1],
          data: {
            download_url,
          },
        });
      },
    };

    // Listen for messages
    window.socket.addEventListener("message", (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type && data) {
        eventList[type](data);
      }
    });

    window.socket.addEventListener("error", () => {
      window.socket.close();
    });

    // Connection
    window.socket.addEventListener("close", async () => {
      interval.forEach((item) => clearInterval(item));
      if (idToken.value) await socketConnect();
    });
  };
};
