export default function WarningBanner() {
  return (
    <div className="w-1/2 mx-auto bg-yellow-600 text-white py-2 px-4 text-center font-medium rounded-md shadow-lg mt-4">
      <p className="text-sm font-medium">
        ⚠️ This app is for development purposes only.
      </p>
      <ul className="mt-2 text-sm font-extralight text-white text-left list-disc list-inside">
        <li>
          Images stored in this app are not permanent and may be deleted at any
          time.
        </li>
        <li>
          This service is not intended for long-term storage or production use.
        </li>
        <li>
          As this is a free-tier project, there are no guarantees for data
          retention.
        </li>
      </ul>
    </div>
  );
}
