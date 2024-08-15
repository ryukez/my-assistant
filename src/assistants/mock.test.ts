import { TextMessage } from "./message";
import { MockAssistant } from "./mock";

describe("MockAssistant", () => {
  it("should respond with a message containing the original message", async () => {
    // Arrange
    const assistant = new MockAssistant();

    // Act
    const responses = [];
    for await (const response of assistant.respond({
      id: "test-message",
      message: new TextMessage("Hello, world!"),
    })) {
      responses.push(response);
    }

    // Assert
    expect(responses.length).toBe(2);

    expect(responses[0]).toEqual({
      id: expect.any(String),
      message: new TextMessage("Hello World!"),
    });

    expect(responses[1]).toEqual({
      id: expect.any(String),
      message: new TextMessage("Your message: Hello, world!"),
    });
  });
});
