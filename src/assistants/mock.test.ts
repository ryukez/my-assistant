import { TextMessageContent } from "./message";
import { MockAssistant } from "./mock";

describe("MockAssistant", () => {
  it("should respond with a message containing the original message", async () => {
    // Arrange
    const assistant = new MockAssistant();

    // Act
    const responses = [];
    for await (const response of assistant.respond({
      id: "test-message",
      content: new TextMessageContent("Hello, world!"),
      threadId: "test-thread",
    })) {
      responses.push(response);
    }

    // Assert
    expect(responses.length).toBe(2);

    expect(responses[0]).toEqual({
      id: expect.any(String),
      content: new TextMessageContent("Hello World!"),
      threadId: "test-thread",
    });

    expect(responses[1]).toEqual({
      id: expect.any(String),
      content: new TextMessageContent("Your message: Hello, world!"),
      threadId: "test-thread",
    });
  });
});
