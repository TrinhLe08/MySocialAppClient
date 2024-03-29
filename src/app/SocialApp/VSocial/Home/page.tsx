"use client";
import dotenv from "dotenv";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { recoilPersist } from "recoil-persist";
import { ThumbsUp, Send } from "lucide-react";
import _ from "lodash";
import { MyPostType } from "./DeletePost/page";
import { DataUser } from "../Profile/page";
import { ViewCommentType } from "./DeletePost/page";
import postData from "@/app/CRUDdata/postData";
import Recoil from "@/app/recoilContextProvider";
dotenv.config();

console.log(`${process.env.NEXT_PUBLIC_URL_SERVER_SOCKET}`);
const MyPost = dynamic(() => import("./Post/page"), { ssr: false });
const UpdateDeletePost = dynamic(() => import("./DeletePost/page"), {
  ssr: false,
});

function HomeApp() {
  const [spin, setSpin] = useState(true);
  const [edit, setEdit] = useState(true);
  const [post, setPost] = useState(false);
  const [checkComment, setCheckComment] = useState(false);
  const [spinConnect, setSpinConnect] = useState(false);
  const [value, setValue] = useRecoilState(Recoil.AtomUser);
  const [checkIdToUpdateLike, setCheckIdToUpdateLike] = useRecoilState(
    Recoil.AtomCheckIdToUpdateLike
  );
  const [valueOtherUser, setValueOtherUser] = useRecoilState(
    Recoil.AtomOtherUser
  );
  const [comment, setComment] = useRecoilState(Recoil.AtomViewComment);
  const [commentKey, setCommentKey] = useRecoilState(Recoil.AtomCommentValue);
  const [postValue, setPostValue] = useRecoilState(Recoil.AtomPost);
  const [mypostValue, setMyPostValue] = useRecoilState(Recoil.AtomMyPost);
  const [commentValue, setCommentValue] = useRecoilState(Recoil.AtomComment);
  const ValuesCheckIdToUpdateLike: any = useRecoilValue(
    Recoil.AtomCheckIdToUpdateLike
  );
  const Value: DataUser = useRecoilValue(Recoil.AtomUser);
  let ValuePost: MyPostType[] = useRecoilValue(Recoil.AtomPost);
  const ValueComment: ViewCommentType[] = useRecoilValue(Recoil.AtomComment);
  const KeyComment: ViewCommentType = useRecoilValue(Recoil.AtomCommentValue);
  const PostTop: MyPostType[] = useRecoilValue(Recoil.AtomPostTop);
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 50,
        color: "black",
      }}
      spin
    />
  );

  console.log(PostTop, 11);

  const antTopPost = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "black",
      }}
      spin
    />
  );

  // Chưa Đăng Nhập -> Cút
  useEffect(() => {
    const webToken = localStorage.getItem("token");

    if (!webToken) {
      router.push("/SocialApp/VSocial?log=Login");
    }
  }, [router]);

  useEffect(() => {
    setTimeout(() => {
      setSpin(false);
    }, 700);
  }, []);

  const ToPost = (id: string) => {
    const scrollToElement = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    };
    scrollToElement(id);
  };

  const Like = async (id: string, like: boolean) => {
    const index: any = ValuePost.findIndex((item): any => item._id === id);
    if (index !== -1) {
      // Tạo một bản sao của phần tử tại index
      const updatedPost = { ...ValuePost[index], like: !like };
      // Tạo một bản sao của mảng ValuePost
      console.log(updatedPost, 103);
      if (!like) {
        updatedPost.numberOflike = updatedPost.numberOflike + 1;
        setCheckIdToUpdateLike([...checkIdToUpdateLike, id]);
      } else {
        updatedPost.numberOflike = updatedPost.numberOflike - 1;
        setCheckIdToUpdateLike([...checkIdToUpdateLike, id]);
      }
      console.log(ValuesCheckIdToUpdateLike, 120);
      const updatedPosts = [...ValuePost];
      // Gán phần tử đã được cập nhật trong mảng mới
      updatedPosts[index] = updatedPost;
      // Cập nhật mảng ValuePost với mảng mới đã cập nhật
      setPostValue(updatedPosts);
    }
  };

  const ViewComment = async (id: string) => {
    setComment(true);
    setCommentKey(id);
    const postId = id;

    const response: any = await postData(
      { postId },
      `${process.env.NEXT_PUBLIC_URL_SERVER}/v/view-comment-Post`
    );

    setCommentValue(response.data);
  };

  const Comment = async () => {
    let valueComment = inputRef.current?.value;

    if (valueComment == "") {
      return;
    }
    if (!checkComment) {
      setCheckComment(true);
      const postId = KeyComment;
      const data = {
        postId,
        userId: Value._id,
        linkAvatar: Value.linkAvatar,
        name: Value.name,
        content: valueComment,
      };

      const response: any = await postData(
        data,
        `${process.env.NEXT_PUBLIC_URL_SERVER}/v/comment-Post`
      );

      setCommentValue(response.data.arrayComment);
      setPostValue(response.data.updatedViewPost);
      setMyPostValue(response.data.myPost);
      setValue(response.data.UserUpdate);
      setCheckComment(false);
    }
  };

  const OtherProfile = async (id: string) => {
    setSpinConnect(true);
    window.scrollTo(0, 0);
    setTimeout(async () => {
      const url = window.location.href;
      const urlParams = new URLSearchParams(new URL(url).search);
      const userIdParams = urlParams.get("orther-profile-user");
      const userId = id;
      const myId = Value._id;
      if (userId == Value._id || id == Value._id) {
        router.push(`/SocialApp/VSocial?profile=Profile`);
        return;
      }
      const response: any = await postData(
        { userId, myId },
        `${process.env.NEXT_PUBLIC_URL_SERVER}/v/other-user-profile`
      );
      setValueOtherUser(response.data.OtherUserProfile);
      router.push(`/SocialApp/VSocial?orther-profile-user=${userId}`);
      window.scrollTo(0, 0);
    }, 500);
  };

  function HomePost() {
    return (
      <div className="flex">
        <div className="w-full h-atuo grid justify-center mt-4 z-10 ">
          {spin ? (
            <div className="w-[1100px] h-full pl-[700px] bg-white pr-96 pt-60 flex justify-center z-2 absolute  top-0">
              <Spin indicator={antIcon} className="relative" />
            </div>
          ) : null}
          <div className=" w-full grid gap-2 h-auto pl-96 pr-96 mt-5">
            {post ? <MyPost /> : null}
          </div>
          {ValuePost.map((p: any) => (
            <div
              className="w-full grid gap-2 h-auto pl-96 pr-96 mt-5 text-left"
              key={p._id}
            >
              <div className="w-[700px] flex items-center gap-5 text-2xl text-left">
                <img
                  src={p.linkAvatar}
                  alt=""
                  className="w-20 h-20 rounded-full"
                />
                <div className="grid gap-2 text-left">
                  <button
                    id={`${p._id}`}
                    className="underline text-left"
                    onClick={() => {
                      OtherProfile(p.userId);
                    }}
                  >
                    {p.name}
                  </button>
                  <span className="text-sm no-underline font-semibold text-slate-500">
                    {p.time}
                  </span>
                </div>
              </div>
              <p>{p.capOfPost}</p>
              <div>
                <img src={p.linkImg} alt="" className="w-full h-full" />
              </div>
              <div className="flex gap-10 text-2xl">
                <span className="flex gap-5 text-2xl">
                  <span>{p.numberOflike}</span>
                  <button
                    id={p._id}
                    className={
                      p.like
                        ? "w-12 h-9 flex justify-center items-center border-2 border-black-700 rounded-lg bg-black text-white"
                        : "w-12 h-9 flex justify-center items-center border-2 border-black-700 rounded-lg bg-white text-black"
                    }
                    onClick={() => Like(p._id, p.like)}
                  >
                    <ThumbsUp />
                  </button>
                </span>
                <span className="flex gap-5 text-2xl">
                  <span>{p.numberOfComment}</span>
                  <button
                    className="underline"
                    onClick={() => ViewComment(p._id)}
                  >
                    Bình Luận
                  </button>
                </span>
              </div>
              <p className=" w-fullflex border-b-2 border-black-700 pb-4 text-2xl"></p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function CommentBox() {
    return (
      <div className="grid w-40 mt-8 h-80 ">
        <h1 className="border-b-2 border-black-700">Bình Luận: </h1>
        <div className="w-[250px] h-80 overflow-auto ">
          <div>
            {ValueComment.map((v: any, index: number) => (
              <div className="grid mt-5 gap-5" key={index}>
                <div className="flex gap-3">
                  <img
                    src={v.linkAvatar}
                    alt=""
                    className="w-9 h-9 rounded-full"
                  />
                  <div className="grid gap-1">
                    <button
                      className="text-base font-bold underline text-left"
                      onClick={() => OtherProfile(v.userId)}
                    >
                      {v.name}
                    </button>
                    <p className="w-40 text-xs">{v.content} </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex ml-2 mt-1 gap-5 pt-3 border-t-2 border-black-700">
          <textarea
            rows={4}
            cols={50}
            ref={inputRef}
            placeholder={
              checkComment ? "Đang Tải Bình Luận " : "Nhập Bình Luận Ở Đây ..."
            }
            className="w-40 h-10 border-2 border-black-700 text-xs pl-2 pt-1"
          />
          <button className="text-slate-800 " onClick={() => Comment()}>
            <Send />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-auto pt-20">
        {spinConnect ? (
          <div className="w-full h-screen overflow-auto z-50 mt-20 items-center bg-white flex justify-center z-2 absolute  top-0">
            <Spin indicator={antIcon} className="relative" />
          </div>
        ) : null}
        <div className="grid justify-center gap-5 w-80 h-full w-2/6 bg-white border-r-2 border-black-700 text-center pt-10 fixed z-20">
          <h1 className="text-2xl font-semibold ">Những Bài Viết Nổi Bật : </h1>
          <div className="grid gap-10 text-2xl font-medium mb-96 text-left">
            {spin ? (
              <div className="w-11/12 h-full z-20 bg-white mt-24 flex justify-center z-2 absolute top-0">
                <Spin indicator={antTopPost} className="relative" />
              </div>
            ) : null}
            {PostTop.map((p: any, index: number) => (
              <button
                className="tetx-left"
                onClick={() => ToPost(p._id)}
                key={p._id}
              >
                {index + 1} . <span className="underline">{p.name}</span>,
                <span className="underline font-semibold">
                  {p.numberOflike}
                </span>
                Like
              </button>
            ))}
          </div>
        </div>

        {edit ? <HomePost /> : <UpdateDeletePost />}

        <div className="flex justify-end gap-5 w-96 left-3/4 top-20 h-full ml-80 pr-96 text-xl pt-10 fixed z-20 ">
          <div className="grid gap-5 h-24 pl-10 border-l-2 border-black-700 ">
            <button
              className="w-56 h-10 border-2 border-black-700 rounded-lg bg-black text-white"
              onClick={() => {
                setEdit(true);
                setPost(!post);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Tạo Bài Viết
            </button>
            <button
              className="w-56 h-10 border-2 border-black-700 rounded-lg bg-black text-white"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setEdit(!edit);
              }}
            >
              {edit ? "Xóa Bài Viết " : "Quay Lại"}
            </button>
            {comment ? <CommentBox /> : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default function HomeAppV() {
  const { persistAtom } = recoilPersist();

  return (
    <>
      <HomeApp />
    </>
  );
}
