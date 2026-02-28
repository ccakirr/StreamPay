import { NextRequest, NextResponse } from "next/server";

const MONORACLE_BASE_URL = "https://api.monoracle.xyz";
const MONORACLE_API_KEY = process.env.MONORACLE_API_KEY || "";

// POST - Write data to Monoracle
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { data } = body;

        if (!data) {
            return NextResponse.json(
                { success: false, error: "Missing data field" },
                { status: 400 }
            );
        }

        const response = await fetch(`${MONORACLE_BASE_URL}/feeds/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                network: "monad-testnet",
                data,
                apiKey: MONORACLE_API_KEY,
            }),
        });

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Monoracle proxy write error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET - Read data from Monoracle
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const contractAddress = searchParams.get("contractAddress");

        if (!contractAddress) {
            return NextResponse.json(
                { success: false, error: "Missing contractAddress" },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${MONORACLE_BASE_URL}/feeds/read?contractAddress=${contractAddress}&network=monad-testnet`,
            { method: "GET" }
        );

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Monoracle proxy read error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
