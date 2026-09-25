"use client";
import { api } from "@/config/axios";
import useGetNotes, { Note } from "@/hooks/useGetNotes";
import { getErrorMessage } from "@/utils/getAxiosError";
import { useId, useState } from "react";
import NotesList from "./NotesList";

interface ISubmitNoteRes {
    data: Note,
}

export default function UserNotes() {
    const { data, isLoading, error, addNoteToState } = useGetNotes();
    const [noteTitle, setNoteTitle] = useState<string>("");
    const [noteContent, setNoteContent] = useState<string>("");
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [noteSubmissionError, setNoteSubmissionError] = useState<string | null>(null);
    const noteTitleId = useId();
    const noteContentId = useId();

    function handleNoteTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setNoteTitle(e.target.value);
    }

    function handleNoteContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setNoteContent(e.target.value);
    }

    async function handleSubmitNotes(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        setIsSubmittingNote(true);
        setNoteSubmissionError(null);
        try {
            const res = await api.post<ISubmitNoteRes>("/notes", { title: noteTitle, content: noteContent });
            const resNote = res.data.data;
            addNoteToState(resNote);
            setNoteTitle("");
            setNoteContent("");
        } catch (err) {
            const errMsg = getErrorMessage(err, "Failed to fetch User Notes");
            setNoteSubmissionError(errMsg);
        } finally {
            setIsSubmittingNote(false);
        }
    }

    return (
        <div className="flex flex-col gap-2">

            <p className="font-bold text-xl">Post a Note</p>

            <form className="flex flex-col gap-2" onSubmit={handleSubmitNotes}>
                <label htmlFor={noteTitleId} className="font-bold text-sm">Note Title:</label>
                <input
                    id={noteTitleId}
                    type="text"
                    name="title"
                    placeholder="Enter the Note title here"
                    className="border border-gray-400 rounded-md px-3 py-2 bg-white"
                    required={true}
                    value={noteTitle}
                    onChange={handleNoteTitleChange}
                />
                <label htmlFor={noteContentId} className="font-bold text-sm">Note Content:</label>
                <textarea
                    id={noteContentId}
                    placeholder="Enter the Note Description here"
                    className="border border-gray-400 rounded-md px-3 py-2 bg-white"
                    required={true}
                    value={noteContent}
                    onChange={handleNoteContentChange}
                />
                <button
                    type="submit"
                    className="mt-4 bg-blue-600 text-white rounded-md px-4 py-2 cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed"
                    disabled={isSubmittingNote}
                >
                    {isSubmittingNote ? "Submitting Note... " : "Submit Note"}
                </button>
                {noteSubmissionError && (
                    <p className="font-semibold text-red-400">{noteSubmissionError}</p>
                )}
            </form>
            <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold mt-4">User Notes</h1>
                <p className="text-gray-600 ">Here are some notes and messages left by other users to see.</p>
                <p className="text-gray-500 text-xs">This is the part which will demonstrate XSS attack in practice.</p>
            </div>
            <div className="flex flex-col gap-2 border border-gray-400 mt-2 p-2 rounded-md">
                <NotesList notes={data} isLoading={isLoading} error={error} />
            </div>
        </div>
    )
}