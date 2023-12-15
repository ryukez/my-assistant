export interface Function {
  name: string;
  call(): Promise<string>;
}
