import "./style.css";
import { runTheExample } from "./counter";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Lit Wrapped Keys Example</h1>
    <p class="read-the-docs">
      Checkout the JavaScript console, all the magic is happening there!
    </p>
  </div>
`;

(async () => {
  await runTheExample();
})();

// setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
