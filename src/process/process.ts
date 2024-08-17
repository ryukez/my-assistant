export interface Process {
  // This function is supposed to keep running until the application terminates.
  run(): Promise<void>;
}
