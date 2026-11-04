import { db } from './firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function AdminDashboard() {
  const [polls, setPolls] = useState<any[]>([]);
  const [question, setQuestion] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'polls'), (snapshot) => {
      setPolls(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const createPoll = async () => {
    if (!question) return;
    await addDoc(collection(db, 'polls'), {
      question,
      createdAt: new Date(),
      votes: [],
    });
    setQuestion('');
  };

  const downloadCSV = (poll: any) => {
    const headers = ['Option', 'Timestamp'];
    const rows = poll.votes?.map((v: any) => [v.option, v.timestamp?.toDate().toLocaleString()]) || [];
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `poll_${poll.id}_results.csv`;
    link.click();
  };

  const getChartData = (poll: any) => {
    const votes = poll.votes || [];
    const yesCount = votes.filter((v: any) => v.option === 'Yes').length;
    const noCount = votes.filter((v: any) => v.option === 'No').length;
    return [
      { name: 'Yes', value: yesCount },
      { name: 'No', value: noCount },
    ];
  };

  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord Admin</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Créer un nouveau sondage</h2>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border p-3 rounded w-full mb-4"
          placeholder="Votre question de sondage..."
        />
        <button onClick={createPoll} className="bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700">
          Créer le sondage
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Sondages existants</h2>
        {polls.map(poll => (
          <div key={poll.id} className="bg-white p-4 rounded-lg shadow mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-lg">{poll.question}</h3>
              <p className="text-sm text-gray-500">Votes: {poll.votes?.length || 0}</p>
            </div>
            <div className="h-32 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getChartData(poll)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} fill="#8884d8">
                    {getChartData(poll).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <button onClick={() => downloadCSV(poll)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Télécharger CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
