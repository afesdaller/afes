import mitt from "mitt";

type Events = {
  "nav:active": { rect: DOMRect };
  "nav:hover": { buttonHref: string };
  "nav:unhover": { buttonHref: string };
  "mobile:menu:open": { isOpen: boolean };
  "loading:end": undefined;
};

const emitter = mitt<Events>();
export default emitter;
