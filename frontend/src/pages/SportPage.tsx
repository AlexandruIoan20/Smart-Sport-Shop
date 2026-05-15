import { useEffect, useState } from "react";
import SportCard from "../components/SportCard";

type Sport = {
  sportId: string;
  name: string;
  description: string;
  teamSport: boolean;
  outdoor: boolean;
  effortLevel: number;
  minBudget: number;
  imageUrl: string | null;
  active: boolean;
};

export default function SportPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8081/api/sports")
      .then((res) => res.json())
      .then((data) => {
        setSports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Eroare la fetch sports:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-white p-6">
        Se încarcă sporturile...
      </div>
    );
  }

  return (
    <div className="p-6">
      
      <h1 className="text-2xl font-bold text-white mb-6">
        Toate Sporturile
      </h1>

      {/* GRID RESPONSIVE */}
      <div className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        md:grid-cols-3 
        lg:grid-cols-4 
        gap-4
      ">
        {sports.map((sport) => (
          <SportCard key={sport.sportId} sport={sport} />
        ))}
      </div>

    </div>
  );
}