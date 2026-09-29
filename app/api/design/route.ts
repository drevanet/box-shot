import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

import { getCurrentUser } from "@/lib/auth";
import {
  getUserDesign,
  saveUserDesign,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// GET DESIGN
// ============================================================

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    const design = await getUserDesign(user.id);

    return NextResponse.json({
      design,
    });
  } catch (error) {
    console.error("GET DESIGN ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to load design.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// SAVE DESIGN
// ============================================================

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const designId =
      typeof body.id === "string" && body.id.trim()
        ? body.id
        : `design_${randomBytes(16).toString("hex")}`;

    const faceImages = body.faceImages || {};

    await saveUserDesign({
      id: designId,
      userId: user.id,

      front:
        typeof faceImages.front === "string"
          ? faceImages.front
          : null,

      back:
        typeof faceImages.back === "string"
          ? faceImages.back
          : null,

      left:
        typeof faceImages.left === "string"
          ? faceImages.left
          : null,

      right:
        typeof faceImages.right === "string"
          ? faceImages.right
          : null,

      top:
        typeof faceImages.top === "string"
          ? faceImages.top
          : null,

      bottom:
        typeof faceImages.bottom === "string"
          ? faceImages.bottom
          : null,

      width:
        Number.isFinite(Number(body.width))
          ? Number(body.width)
          : 28,

      height:
        Number.isFinite(Number(body.height))
          ? Number(body.height)
          : 36,

      depth:
        Number.isFinite(Number(body.depth))
          ? Number(body.depth)
          : 11,

      rotationY:
        Number.isFinite(Number(body.rotationY))
          ? Number(body.rotationY)
          : -22,

      boxColor:
        typeof body.boxColor === "string"
          ? body.boxColor
          : "#f5f5f5",

      backgroundColor:
        typeof body.backgroundColor === "string"
          ? body.backgroundColor
          : "#111111",

      selectedFace:
        typeof body.selectedFace === "string"
          ? body.selectedFace
          : "front",
    });

    return NextResponse.json({
      success: true,
      id: designId,
    });
  } catch (error) {
    console.error("SAVE DESIGN ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to save design.",
      },
      {
        status: 500,
      }
    );
  }
}