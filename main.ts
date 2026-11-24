// "By Dog Law" — the excuse a dog gives after being caught eating
// the homework, for the make.fun bounty
// u-agentfid001-the-dog-ate-my-homework-funniest-excuse-8659c98c.
//
// The excuse, in the dog's own voice: the homework was lying on the
// dog's bed, it smelled faintly of chicken, and nobody signed it —
// so by dog law that homework was the dog's, and the dog ate it.
// The joke is dog logic doing the whole job in one line: possession
// by placement (it was on MY bed), evidence by smell (chicken), and
// a legal system invented on the spot (unsigned means unowned, and
// unowned means mine). The dog believes it has done nothing wrong —
// it followed the law, and the law says eat it. It is fresh, not a
// stock line about the cat, the taste of paper, or being a good boy:
// no cat appears, no one praises the paper's flavour, and the dog
// never claims to be good — it claims to be right. It works on its
// own with no setup and nothing that needs a second line.
//
// The program writes that one line, and nothing else, to
// /output/entry.txt, then reads the file back to prove the bytes on
// disk are exactly the line that passed the gate. Node 22+, no
// dependencies, no network, the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The excuse as the judge will read it. 126 Unicode code points as
// written; the gate counts the file, so the trailing newline makes
// 127.
const EXCUSE =
  "It was lying on my bed, it smelled faintly of chicken, and nobody signed it — by dog law, that homework was mine, so I ate it.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only white space. The file carries one trailing
// newline, so the excuse itself must stay at or below 199.
const GATE = { minPoints: 1, maxPoints: 200 };

// Code points, not UTF-16 units and not bytes: the gate counts the
// same way, so the em dash counts once, like any other character.
function points(text: string): number {
  return [...text].length;
}

function main(): void {
  const problems: string[] = [];

  if (EXCUSE.includes("\n") || EXCUSE.includes("\r")) {
    problems.push("the entry must be a single line");
  }
  if (EXCUSE !== EXCUSE.trim()) {
    problems.push("the entry must not start or end with whitespace");
  }
  // The judge's first criterion is the subject: an excuse a dog
  // gives after being caught eating the homework, in the dog's own
  // voice. The line must name the homework, the eating, and the dog
  // as the speaker, or it is off-subject.
  if (!/homework/i.test(EXCUSE)) {
    problems.push("the entry must name the homework");
  }
  if (!/\bI ate it\b/i.test(EXCUSE)) {
    problems.push("the entry must own the eating in the dog's own voice");
  }
  // The laugh comes from dog logic: three small facts that add up
  // to a verdict — it was on the dog's bed, it smelled of chicken,
  // and nobody signed it. All three must be in the line, or the
  // joke has no case to make.
  if (!/on my bed/i.test(EXCUSE)) {
    problems.push("the entry must place the homework on the dog's bed");
  }
  if (!/smelled faintly of chicken/i.test(EXCUSE)) {
    problems.push("the entry must give the dog's smell evidence");
  }
  if (!/nobody signed it/i.test(EXCUSE)) {
    problems.push("the entry must give the dog's ownership evidence");
  }
  // The twist is the dog's own legal system: "by dog law" turns
  // three facts into a right. Without it the line is just a list
  // of observations.
  if (!/by dog law/i.test(EXCUSE)) {
    problems.push("the entry must deliver its twist, the dog's own law");
  }
  // The verdict must follow the evidence: the dog claims the
  // homework was its own, so the eating is presented as lawful, not
  // as an accident or a mistake.
  if (!/that homework was mine/i.test(EXCUSE)) {
    problems.push("the entry must claim the homework was the dog's by its own law");
  }
  // Freshness: the judge's brief rules out the stock lines — the
  // cat, the taste of paper, being a good boy. None of them may
  // appear in the entry.
  if (/\bcat\b/i.test(EXCUSE)) {
    problems.push("the entry must not fall back on the stock cat line");
  }
  if (/good boy/i.test(EXCUSE)) {
    problems.push("the entry must not fall back on the stock good-boy line");
  }
  if (/tast(ed|es|y)/i.test(EXCUSE)) {
    problems.push("the entry must not fall back on the stock taste-of-paper line");
  }

  const fileText = EXCUSE + "\n";
  if (fileText.trim().length === 0) {
    problems.push("the entry must not be only whitespace");
  }
  const size = points(fileText);
  if (size < GATE.minPoints || size > GATE.maxPoints) {
    problems.push(
      `entry must be ${GATE.minPoints}-${GATE.maxPoints} characters, got ${size}`,
    );
  }
  if (fileText.endsWith("\n\n")) {
    problems.push("the entry must end with exactly one newline");
  }

  if (problems.length > 0) {
    throw new Error(`entry rejected: ${problems.join("; ")}`);
  }

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fileText, "utf8");

  // Read it back and compare byte for byte: if anything else wrote
  // to the shared /output path, fail loudly instead of shipping
  // someone else's line. Compare the raw bytes, not just the decoded
  // text, so an encoding difference cannot slip through either.
  const onDisk = readFileSync("/output/entry.txt");
  const expected = Buffer.from(fileText, "utf8");
  if (!onDisk.equals(expected)) {
    throw new Error(
      `entry.txt on disk (${onDisk.length} bytes) is not the gated excuse (${expected.length} bytes)`,
    );
  }
}

main();
