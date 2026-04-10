import InterviewHeader from '../components/Interview/InterviewHeader';
import InterviewProblem from '../components/Interview/InterviewProblem';
import InterviewEditor from '../components/Interview/InterviewEditor';
import InterviewVideoChat from '../components/Interview/InterviewVideoChat';

const Interview = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col">
            <InterviewHeader />

            {/* Main 3-Column Layout */}
            <main className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 min-h-0 z-10">
                <InterviewProblem />
                <InterviewEditor socket={null as any} interviewId="" role="student" />
                <InterviewVideoChat />
            </main>

            {/* Global styles for custom scrollbar in this layout */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #050505;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}} />
        </div>
    );
};

export default Interview;
