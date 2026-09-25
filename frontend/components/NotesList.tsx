import { Note } from "@/hooks/useGetNotes";

export default function NotesList({ notes, isLoading, error }: { notes: Note[] | null, isLoading: boolean, error: string | null }) {
    if (isLoading) {
        return <p> Loading Notes ....</p>;
    }

    if (error && error.length > 0) {
        return <p> Error Fetching Notes: {error}</p>
    }

    if(!notes) {
        return <p> No Data</p>
    }

    if (notes.length === 0) {
        return <p> Notes is Empty</p>;
    }

    return (
        <div className="flex flex-col gap-2">
            {
                notes.map((note) => {
                    return (
                        <div className="flex flex-col border border-gray-400 p-4" key={note.id + ""}>
                            <p className="font-bold">{note.title}</p>
                            <p>{note.content}</p>
                            <p>By: {note.username}</p>
                        </div>
                    )
                })
            }
        </div>
    )
}