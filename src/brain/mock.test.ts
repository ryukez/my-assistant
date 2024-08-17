import { TextMessageContent } from "../app";
import { MockBrain } from "./mock";

describe("MockBrain", () => {
  it("should respond with a message containing the original message", async () => {
    // Arrange
    const brain = new MockBrain();

    // Act
    const responses = [];
    for await (const response of brain.respond({
      id: "test-message",
      content: new TextMessageContent("Hello, world!"),
    })) {
      responses.push(response);
    }

    // Assert
    expect(responses.length).toBe(2);

    expect(responses[0]).toEqual({
      id: expect.any(String),
      content: new TextMessageContent("Hello World!"),
    });

    expect(responses[1]).toEqual({
      id: expect.any(String),
      content: new TextMessageContent("Your message: Hello, world!"),
    });
  });
});
