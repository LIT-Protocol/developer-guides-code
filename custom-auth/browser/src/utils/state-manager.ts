type StepExecution = {
  step: number;
  input?: any;
  inputType?: "code";
  output?: any;
  outputData?: any;
  outputDataType?: "code";
};

type State = {
  steps: StepExecution[];
};

const state: State = {
  steps: [],
};

export const logStep = (stepExecution: StepExecution) => {
  const existingStepIndex = state.steps.findIndex(
    (execution) => execution.step === stepExecution.step
  );

  if (existingStepIndex !== -1) {
    // Overwrite the existing step execution
    const existingStepExecution = state.steps[existingStepIndex];
    state.steps[existingStepIndex] = {
      ...existingStepExecution,
      ...stepExecution,
    };
  } else {
    // Add a new step execution
    state.steps.push(stepExecution);
  }

  console.log(`Step ${stepExecution.step} executed:`, stepExecution);
  updateStateLog();
};

export const getOutputData = ({ step }) => {
  const data = state.steps.find((state) => state.step === step)?.outputData;

  if (!data) {
    logStep({
      step,
      output: `❌ Error: No output data found for step ${step}`,
    });
  }

  return data;
};

const updateStateLog = () => {
  state.steps.forEach(({ step, input, output, outputDataType, inputType }) => {
    // Select the row with the corresponding step number
    const row = document.querySelector(`table tbody tr:nth-child(${step})`);
    if (row) {
      // Update the Input and Output cells
      const inputCell = row.children[3];
      const outputCell = row.children[4];

      if (inputType === "code") {
        inputCell.innerHTML = `<pre><code class="language-typescript">
${input}
      </code></pre>`;
      } else {
        inputCell.textContent =
          typeof input === "string" ? input : JSON.stringify(input);
      }

      if (outputDataType === "code") {
        outputCell.innerHTML = `<pre><code class="language-typescript">
${output}
      </code></pre>`;
      } else {
        outputCell.textContent =
          typeof output === "string" ? output : JSON.stringify(output);
      }
    }
  });

  // @ts-ignore
  hljs.highlightAll();
};
