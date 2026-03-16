import { readFile, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

const PROGRESS_FILE = path.join(process.cwd(), "data", "progress.json");

export async function GET() {
  try {
    const content = await readFile(PROGRESS_FILE, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const data = await request.json();
  await writeFile(PROGRESS_FILE, JSON.stringify(data, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}
