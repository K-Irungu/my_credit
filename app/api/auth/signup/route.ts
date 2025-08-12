import { NextResponse } from "next/server";
import { signup } from "../../../../controllers/auth/signupController";

export async function POST(req: Request) {

  try {
    const { fullName, email, phoneNumber, password, confirmPassword } =
      await req.json();

    // 1) Validate required fields
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      return NextResponse.json(
        {
          status: 400,
          message: "Missing required fields",
          data: [],
        },
        { status: 400 }
      );
    }

    // 2) Call signup controller and return its response directly
    return await signup(
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword
    );
  } catch (err: any) {
    console.error("Signup API error:", err);

    // Step 3: Return internal server error
    return NextResponse.json(
      { status: 500, message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
}
