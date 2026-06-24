export default function assertNativeStepResult(output) {
  const data = typeof output === "string" ? JSON.parse(output) : output;
  const requiredTopLevel = [
    "status",
    "step",
    "skill",
    "target",
    "eventsPath",
    "proofPath",
    "lastMessagePath",
    "failures",
    "checks",
  ];
  const missingTopLevel = requiredTopLevel.filter((key) => !(key in data));
  if (missingTopLevel.length > 0) {
    return {
      pass: false,
      score: 0,
      reason: `missing top-level keys: ${missingTopLevel.join(", ")}`,
    };
  }

  const checkKeys = [
    "skillRead",
    "referenceReads",
    "helperObserved",
    "proofMarkers",
    "manualPacket",
    "forbiddenWrites",
  ];
  const missingChecks = checkKeys.filter((key) => typeof data.checks[key] !== "boolean");
  if (missingChecks.length > 0) {
    return {
      pass: false,
      score: 0,
      reason: `missing boolean checks: ${missingChecks.join(", ")}`,
    };
  }

  const expectedStatus = data.expectedStatus || "pass";
  if (data.status !== expectedStatus) {
    return {
      pass: false,
      score: 0,
      reason: `status ${data.status} did not match expected ${expectedStatus}: ${(data.failures || []).join("; ")}`,
    };
  }

  const failures = Array.isArray(data.failures) ? data.failures.join("\n") : "";
  const expectedFailures = Array.isArray(data.expectedFailureIncludes) ? data.expectedFailureIncludes : [];
  const missingFailures = expectedFailures.filter((marker) => !failures.includes(marker));
  if (missingFailures.length > 0) {
    return {
      pass: false,
      score: 0,
      reason: `missing expected failure markers: ${missingFailures.join(", ")}`,
    };
  }

  if (expectedStatus === "pass" && data.failures.length > 0) {
    return {
      pass: false,
      score: 0,
      reason: `pass case included failures: ${data.failures.join("; ")}`,
    };
  }

  return {
    pass: true,
    score: 1,
    reason: `${data.step} ${data.skill} ${data.status}`,
  };
}
