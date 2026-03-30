import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Look for scan results in the project root
    const scanPaths = [
      path.join(process.cwd(), ".dx-ray", "latest-scan.json"),
      path.join(process.cwd(), "..", "..", ".dx-ray", "latest-scan.json"),
    ];

    for (const scanPath of scanPaths) {
      try {
        const data = fs.readFileSync(scanPath, "utf-8");
        return NextResponse.json(JSON.parse(data));
      } catch {
        continue;
      }
    }

    return NextResponse.json(
      { error: "No scan results found" },
      { status: 404 },
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
