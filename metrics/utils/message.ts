export type Length = "short" | "medium" | "large";

export function getMessage(length: Length): string {
  if (length === "short") {
    return "Lorem";
  } else if (length === "medium") {
    return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam elementum.";
  } else {
    return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ex risus, porttitor sed lacus id, egestas lobortis purus. Curabitur consectetur metus ut est vehicula egestas. Class aptent taciti sociosqu ad.";
  }
}
