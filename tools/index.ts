"use generative";

import { defineToolkit } from "@assistant-ui/react";
import generativeUITools from "./generative-ui";
import salesTools from "./sales-toolkit";
import weatherTools from "./weather-toolkit";

export default defineToolkit({
  ...weatherTools,
  ...salesTools,
  ...generativeUITools,
});
