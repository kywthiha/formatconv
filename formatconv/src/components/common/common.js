// Enterキーイベント対応
export function handleKeyDown(e) {
  console.log("in handle Key down ", e);

  if (e.keyCode === 13 && e.srcElement.__vnode.type !== "button") {
    e.preventDefault();
  }
}
