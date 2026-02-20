type Props = {
  protocol: string;
  os: string;
  conference: string;
  setProtocol: (v: string) => void;
  setOs: (v: string) => void;
  setConference: (v: string) => void;
};

export default function FiltersBar({
  protocol,
  os,
  conference,
  setProtocol,
  setOs,
  setConference,
}: Props) {
  return (
    <div className="flex gap-4 bg-white p-4 rounded-xl shadow">
      <select value={protocol} onChange={(e) => setProtocol(e.target.value)}>
        <option value="ALL">All Protocols</option>
        <option value="Web">Web</option>
        <option value="AirPlay">AirPlay</option>
        <option value="Miracast">Miracast</option>
        <option value="Google Cast">Google Cast</option>
        <option value="HDMI">HDMI</option>
      </select>

      <select value={os} onChange={(e) => setOs(e.target.value)}>
        <option value="ALL">All OS</option>
        <option value="MacOS">MacOS</option>
        <option value="Windows">Windows</option>
        <option value="iOS">iOS</option>
        <option value="Android">Android</option>
      </select>

      <select
        value={conference}
        onChange={(e) => setConference(e.target.value)}
      >
        <option value="ALL">All Conference</option>
        <option value="Teams">Teams</option>
        <option value="Zoom">Zoom</option>
        <option value="Presentation Only">Presentation Only</option>
      </select>
    </div>
  );
}
