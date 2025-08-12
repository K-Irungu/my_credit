import { NextResponse } from "next/server";
import { login } from "@/controllers/auth/loginController";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          status: 400,
          message: "Email and password are required",
          data: null,
        },
        { status: 400 }
      );
    }

    const result = await login(email, password);


    return new NextResponse(
      JSON.stringify({
        status: result.status,
        message: result.message,
        data: result.data,

      })
    );
    
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
