export type Rubric = {
  mustInclude?: string[];
  mustNotInclude?: string[];
  minLength?: number;
  maxLength?: number;
  jsonKeys?: string[];
};

export type TestCase = {
  id: string;
  description?: string;
  input: string;
  rubric: Rubric;
  /** Optional expected category for the mock agent routing. */
  expectCategory?: string;
};

export type Suite = {
  name: string;
  description?: string;
  cases: TestCase[];
};

export type AgentAdapter = {
  name: string;
  complete: (input: string, testCase: TestCase) => Promise<string>;
};

export type CaseResult = {
  id: string;
  pass: boolean;
  output: string;
  failures: string[];
};

export type SuiteResult = {
  suite: string;
  adapter: string;
  passed: number;
  failed: number;
  cases: CaseResult[];
  generatedAt: string;
};
