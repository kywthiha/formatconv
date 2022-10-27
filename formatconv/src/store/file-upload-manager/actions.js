import { CognitoUserPool } from "amazon-cognito-identity-js";
import { POOL_DATA } from "../../config/cognito";

const getToken = () =>
  new Promise((resolve, reject) => {
    const userPool = new CognitoUserPool(POOL_DATA);
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getSession(function (err, session) {
        if (err) {
          reject(err);
        }
        resolve(session.idToken.jwtToken);
      });
    } else {
      reject("Unauthorized");
    }
  });

export default {
  addFileItems(context, payload) {
    context.commit("addFileItems", payload);
  },
  setFileItems(context, payload) {
    context.commit("setFileItems", payload);
  },
  deleteFileItem(context, payload) {
    context.commit("deleteFileItem", payload);
  },
  updateFileItems(context, payload) {
    context.commit("updateFileItems", payload);
  },
  setConnectionId(context, payload) {
    context.commit("setConnectionId", payload);
  },
  setUploadStatus(context, payload) {
    context.commit("setUploadStatus", payload);
  },
  async requestUploadUrl({ commit, getters }) {
    try {
      const token = await getToken();
      const response = await fetch(
        "https://wdduz75b1m.execute-api.us-east-1.amazonaws.com/test/presigned-url-upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            service_name: import.meta.env.VITE_SERVICE_NAME,
            file_names: getters.getfileItems.map(({ file }) => file.name),
          }),
        }
      );
      const res = await response.json();
      if (response.ok) {
        const { data, connection_id } = res;
        // update state files list
        const fileItemsUploadUrl = getters.getfileItems.map((fileItem) => {
          return {
            ...fileItem,
            ...data.find((i) => i.file_name == fileItem.file.name),
          };
        });
        commit("setConnectionId", connection_id);
        commit("setFileItems", fileItemsUploadUrl);
      } else {
        console.log(res);
        if (res && res.message) {
          alert(res.message);
        } else {
          alert(res);
        }
        commit("setUploadStatus", false);
      }
    } catch (e) {
      console.log(e);
      alert(e);
      commit("setUploadStatus", false);
    }
  },
};
