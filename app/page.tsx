import FileUploadForm from "./components/FileUploadForm";
import GroupImages from "./components/GroupImages";

export default function Home() {
  const path = "imagegroup1/";

  return (
    <div className="flex flex-col justify-center items-center">
      <div>Form</div>
      <FileUploadForm />
      <div>Images</div>
      <GroupImages path={path} />
    </div>
  );
}
