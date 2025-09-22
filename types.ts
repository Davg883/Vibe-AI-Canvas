
export interface ScribeExampleOutput {
  language: string;
  code_with_comments: string;
}

export interface ScribeResponse {
  user_goal_summary: string;
  generated_prompt_for_ai: string;
  example_output: ScribeExampleOutput;
}
