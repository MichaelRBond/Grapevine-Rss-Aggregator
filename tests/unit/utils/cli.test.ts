import { Section } from "command-line-usage";
import { displayCliUsage } from "../../../src/utils/cli";

describe("Unit: cli", () => {
  describe("displayCliUsage()", () => {
    const sections: Section[] = [
      {
        content: `header contents`,
        header: "header",
      },
      {
        header: "Options",
        optionList: [
          {
            alias: "u",
            name: "username",
            type: String,
          },
        ],
      },
    ];

    it("displays expected output", () => {
      console.log = jest.fn();
      displayCliUsage(sections);
      expect(console.log).toHaveBeenCalled();
    });
  });
});
