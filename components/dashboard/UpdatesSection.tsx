interface Props {
  latestVersion: string;
  releaseDate: string;
  releaseNotes: string[];
}

export default function UpdatesSection({
  latestVersion,
  releaseDate,
  releaseNotes,
}: Props) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="font-semibold mb-3">Latest Updates</h3>

      <div className="text-sm text-gray-700">
        <div className="font-medium">{latestVersion}</div>

        <div className="text-gray-500 mb-2">{releaseDate}</div>

        <ul className="list-disc ml-4 space-y-1">
          {releaseNotes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
