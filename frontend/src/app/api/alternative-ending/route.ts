import { NextRequest, NextResponse } from "next/server";

const AGENT_BASE_URL =
    "https://streampay-agent-alternative-endings-production.up.railway.app";

export type EndingType = "happy" | "dark" | "plot-twist";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { video_url, ending_type } = body as {
            video_url: string;
            ending_type: EndingType;
        };

        if (!video_url || !ending_type) {
            return NextResponse.json(
                { success: false, error: "Missing video_url or ending_type" },
                { status: 400 }
            );
        }

        const validTypes: EndingType[] = ["happy", "dark", "plot-twist"];
        if (!validTypes.includes(ending_type)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid ending_type. Must be one of: ${validTypes.join(", ")}`,
                },
                { status: 400 }
            );
        }

        const response = await fetch(`${AGENT_BASE_URL}/ending/${ending_type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ video_url }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Alternative ending API error:", errorText);
            return NextResponse.json(
                { success: false, error: `Agent API error: ${response.status}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Alternative ending proxy error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
