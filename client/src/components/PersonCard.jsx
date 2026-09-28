import Button from "./Button";
import { getDeptCode } from "../data/alumni";

export default function PersonCard({ person }) {
  return (
    <article className="card person">
      <img className="person__photo" src={person.photo} alt={person.name} />
      <div className="person__info">
        <h3 className="person__name">{person.name}</h3>
        <p className="person__meta">
          Reg No: {person.id}<br />
          Batch: {person.batch}<br />
          Department: {getDeptCode(person.department)}
        </p>
        <Button to={`/alumni/${person.id}`} size="sm">View Profile</Button>
      </div>
    </article>
  );
}
