import Button from "./Button";
import { getDeptCode } from "../data/alumni";

export default function PersonCard({ person }) {
  return (
    <article className="card person">
      <img className="person__photo" src={person.photoUrl || person.photo} alt={person.name} />
      <div className="person__info">
        <h3 className="person__name">{person.name}</h3>
        <p className="person__meta">
          Reg No: {person.registrationNo || person.id}<br />
          Batch: Batch {person.batch}<br />
          Dept: {getDeptCode(person.department)}
        </p>
        <Button to={`/alumni/${person.registrationNo || person.id}`} size="sm">View Profile</Button>
      </div>
    </article>
  );
}
