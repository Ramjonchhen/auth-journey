import { api } from "@/config/axios";
import { useEffect, useState } from "react";

export interface Note {
    id: number,
    title: string,
    content: string,
    username: string,
}

export default function useGetNotes() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<Note[] | null>(null)
    const [error, setError] = useState<string | null>(null);

    async function fetchAllNotes() {
        try {
            setIsLoading(true);
            setData(null);
            setError(null)
            const notesRes = await api.get<{ data: Note[] }>("/notes");
            const resData = notesRes?.data?.data ?? [];
            setData(resData);
        } catch (err) {
            const errMes = err instanceof Error ? err.message : "Failed to Load Notes";
            setError(errMes);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchAllNotes()
    }, [])

    function addNoteToState(newNote: {id: number, title: string, content: string, username: string}) {
        setData((prevData) => prevData ? [newNote,...prevData]: [newNote]);
    }

    return { isLoading, error, data, addNoteToState };
}