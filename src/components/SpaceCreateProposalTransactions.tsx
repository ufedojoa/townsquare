import { useEffect } from "react";
import { Block } from "./Block";
import tw from "tailwind-styled-components";
import TextInput from "./TextInput";
import { ChoiceAction } from "@/types";

const InputLabel = tw.label`mb-1 md:mb-1.5 text-lg block font-semibold`;

export const SpaceCreateProposalTransactions = ({
  choices,
  batches,
  setBatches,
}: {
  choices: string[];
  batches: Array<ChoiceAction>;
  setBatches: (v: Array<ChoiceAction>) => void;
}) => {
  // const [batches, setBatches] = useState<Array<ChoiceAction>>([]);

  useEffect(() => {
    setBatches(new Array(choices.length).fill(new ChoiceAction("", "")));
  }, [choices.length, setBatches]);
  return (
    <Block title="Actions">
      <div className="space-y-3 md:space-y-6">
        {batches.map((batch, i) => {
          return (
            <Block
              key={i}
              title={"Choice " + (i + 1) + " (" + choices[i] + ")"}
            >
              <div className="space-y-3">
                <div>
                  <InputLabel>Executor (address)</InputLabel>
                  <TextInput
                    onUserInput={(value) => {
                      const newBatches = [...batches];
                      newBatches[i] = new ChoiceAction(value, batch.data);
                      setBatches(newBatches);
                    }}
                    value={batch.executor ?? ""}
                    maxLength={43}
                    pattern="^0x_[a-fA-F0-9]{40}$"
                  />
                </div>

                <div>
                  <InputLabel>Execution Data (bytes32)</InputLabel>
                  <TextInput
                    onUserInput={(value) => {
                      const newBatches = [...batches];
                      newBatches[i] = new ChoiceAction(batch.executor, value);
                      setBatches(newBatches);
                    }}
                    value={batch.data}
                    maxLength={66}
                  />
                </div>
              </div>
            </Block>
          );
        })}
      </div>
    </Block>
  );
};
