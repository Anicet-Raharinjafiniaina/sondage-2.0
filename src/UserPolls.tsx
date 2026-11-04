import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function UserPolls() {
  const [polls, setPolls] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'polls'), (snapshot) => {
      setPolls(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const vote = async (pollId: string, option: string) => {
    const pollRef = doc(db, 'polls', pollId);
    await updateDoc(pollRef, {
      votes: arrayUnion({ option, timestamp: new Date() })
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Sondages Actifs</h1>
      {polls.length === 0 && <p className="text-center text-gray-500">Aucun sondage pour le moment.</p>}
      {polls.map(poll => (
        <div key={poll.id} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">{poll.question}</h2>
          <div className="flex gap-4">
            <button onClick={() => vote(poll.id, 'Yes')} className="bg-green-100 text-green-700 px-6 py-2 rounded font-medium hover:bg-green-200">Yes</button>
            <button onClick={() => vote(poll.id, 'No')} className="bg-red-100 text-red-700 px-6 py-2 rounded font-medium hover:bg-red-200">No</button>
          </div>
          <p className="text-sm text-gray-500 mt-4">Total votes: {poll.votes?.length || 0}</p>
        </div>
      ))}
    </div>
  );
}
