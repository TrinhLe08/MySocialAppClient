"use client";
import React from "react";
import dotenv from "dotenv";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useRecoilState, useRecoilValue } from "recoil";
import * as Yup from "yup";
import postData from "../CRUDdata/postData";
import Link from "next/link";
import Recoil from "../recoilContextProvider";
import { io } from "socket.io-client";
dotenv.config();

const socket: any = io(`${process.env.NEXT_PUBLIC_URL_SERVER_SOCKET}`);

console.log(process.env.NEXT_PUBLIC_URL_SERVER_SOCKET);
export interface OjectUser {
  username: string;
  password: string;
}
function Login() {
  const [spin, setSpin] = useState(false);
  const [login, setLogin]: [boolean, Dispatch<SetStateAction<boolean>>] =
    useState<boolean>(true);
  const router: any = useRouter();
  const [valueNotification, setValueNotification] = useRecoilState(
    Recoil.AtomNotification
  );
  const [user, setUser] = useRecoilState(Recoil.AtomUser);
  const [post, setPost] = useRecoilState(Recoil.AtomPost);
  const [myPost, setMyPost] = useRecoilState(Recoil.AtomMyPost);
  const [topPost, setTopPost] = useRecoilState(Recoil.AtomPostTop);
  const [values, setValues] = useRecoilState(Recoil.AtomFindUsers);
  const MyValue: any = useRecoilValue(Recoil.AtomUser);
  const [comment, setComment] = useRecoilState(Recoil.AtomViewComment);
  const [checkOnline, setCheckOnline] = useRecoilState(Recoil.AtomCheckOnline);
  const antIcon: JSX.Element = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "black",
      }}
      spin
    />
  );

  const formik: any = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(5, "Tên Phải Nhiều Hơn 5 Kí Tự !")
        .max(15, "Tên Không Được Vượt Quá 15 Kí Tự !")
        .required("Không Được Bỏ Trống Tên !"),
      password: Yup.string()
        .min(5, "Mật Khẩu Phải Nhiều Hơn 5 Kí Tự !")
        .max(20, "Mật Khẩu Không Được Vượt Quá 20 Kí Tự !")
        .required("Không Được Bỏ Trống Mật Khẩu !"),
    }),
    onSubmit: async (values: OjectUser) => {
      setSpin(true);
      setComment(false);
      const responseData: any = await postData(
        values,
        `${process.env.NEXT_PUBLIC_URL_SERVER}/v/login`
      );
      if (responseData.status != 200) {
        setSpin(false);
        setLogin(false);
        return;
      }
      const severData: any = responseData.data;
      // Lưu token vào local
      localStorage.setItem("token", severData.token);
      localStorage.setItem("data", JSON.stringify(severData.user));
      //Truyền data vào Recoil
      const dataRecoil = {
        _id: severData.user._id,
        name: severData.user.name,
        address: severData.user.address,
        connect: severData.user.connect,
        checkConnect: severData.user.checkConnect,
        linkImg: severData.user.linkImg,
        friend: severData.user.friend,
        linkAvatar: severData.user.linkAvatar,
        numberOfPost: severData.user.numberOfPost,
        numberOfLike: severData.user.numberOfLike,
        numberOfComment: severData.user.numberOfComment,
        numberOfFollow: severData.user.numberOfFollow,
      };
      if (responseData.status === 200) {
        setPost(severData.ViewPost);
        setMyPost(severData.myPost);
        setValues(severData.AllUsers);
        setUser(dataRecoil);
        setTopPost(severData.top5Post);
        setLogin(true);
        socket.emit("checkUserOnline", { myId: MyValue._id });
        socket.on("Data check User Online", (response: any) => {
          setCheckOnline(response);
        });

        if (severData.user.connect.length > 0) {
          setValueNotification([severData.user.connect[0].userId]);
        }
        router.push("/SocialApp/VSocial?h=Home");
      }
      setSpin(false);
    },
  });

  return (
    <div>
      <div className="w-full h-screen relative flex justify-center items-center">
        {spin ? (
          <div className="w-full h-screen flex justify-center items-center z-999 absolute bg-gray-300 bg-opacity-50 top-0">
            <Spin indicator={antIcon} className="relative" />
          </div>
        ) : null}
        <div className="w-80 text-center mb-20 h-160">
          <div className="Icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="mx-auto h-6 w-6 mb-2"
            >
              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
            </svg>
          </div>

          <div className="text-2xl font-semibold">Chào Mừng</div>

          <p className="text-teal-800 text-sm w-80 mt-3 mb-3">
            Đăng Nhập Tài Khoản Để Tiếp Tục .
          </p>

          <form onSubmit={formik.handleSubmit} className="w-80 mb-4">
            <input
              type="name"
              value={formik.values.username}
              name="username"
              onChange={formik.handleChange}
              placeholder="Điền Tên Đăng Nhập ."
              className="bg-white border border-teal-400 focus:border-teal-500 rounded-md py-2 px-4 w-full mt-5 h-9"
            />

            <p className="text-red-500 text-xs mr-80 w-80 mt-2 h-2">
              {formik.errors.username && formik.touched.username
                ? formik.errors.username
                : null}
              {!login
                ? "Không Thành Công Mật Khẩu Hoặc Tên Đăng Nhập Sai !"
                : null}
            </p>

            <input
              type="password"
              value={formik.values.password}
              name="password"
              onChange={formik.handleChange}
              placeholder="Điền Mật Khẩu Đăng Nhập ."
              className="bg-white border border-teal-400 focus:border-teal-500 rounded-md py-2 px-4 w-full mt-3 h-9 mb-2"
            />

            <p className="text-red-500 text-xs mr-60 w-80 h-2 mb-1">
              {formik.errors.password && formik.touched.password
                ? formik.errors.password
                : null}
              {!login
                ? "Không Thành Công Mật Khẩu Hoặc Tên Đăng Nhập Sai !"
                : null}
            </p>

            <button
              className="bg-black hover:bg-gray-800 text-white font-xs text-sm py-2 px-4 rounded-md w-80 h-9 mt-2"
              value="Submit"
              type="submit"
            >
              Đăng Nhập Ngay
            </button>
          </form>

          <Link
            href="/RegisterUser"
            className="text-teal-800 underline font-light text-sm mt-20"
            onClick={() => {
              setSpin(true);
            }}
          >
            Bạn Chưa Có Tài Khoản ? Đăng Kí Ngay Tại Đây .
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginV() {
  return (
    <>
      <Login />
    </>
  );
}
