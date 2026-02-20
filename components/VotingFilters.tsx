type Props = {
  state: string;
  ageGroup: string;
  caste: string;
  setState: (v: string) => void;
  setAgeGroup: (v: string) => void;
  setCaste: (v: string) => void;
};

export default function VotingFilters({
  state,
  ageGroup,
  caste,
  setState,
  setAgeGroup,
  setCaste,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow">
      <select
        value={state}
        onChange={(e) => setState(e.target.value)}
        className="border p-2"
      >
        <option value="ALL">All States</option>
        <option value="UP">UP</option>
        <option value="MH">MH</option>
        <option value="RJ">RJ</option>
      </select>

      <select
        value={ageGroup}
        onChange={(e) => setAgeGroup(e.target.value)}
        className="border p-2"
      >
        <option value="ALL">All Ages</option>
        <option value="18-25">18-25</option>
        <option value="26-40">26-40</option>
        <option value="41-60">41-60</option>
        <option value="60+">60+</option>
      </select>

      <select
        value={caste}
        onChange={(e) => setCaste(e.target.value)}
        className="border p-2"
      >
        <option value="ALL">All Castes</option>
        <option value="General">General</option>
        <option value="OBC">OBC</option>
        <option value="SC">SC</option>
        <option value="ST">ST</option>
      </select>
    </div>
  );
}
