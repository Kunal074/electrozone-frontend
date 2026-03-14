import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();
  const file     = formData.get("image");

  const cloudinaryForm = new FormData();
  cloudinaryForm.append("file", file);
  cloudinaryForm.append("upload_preset", "electrozone");
  cloudinaryForm.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: cloudinaryForm }
  );

  const data = await res.json();
  return NextResponse.json({ url: data.secure_url });
}