import { useEffect, useState } from "react";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";

export const useGetCalls = () => {
    const client = useStreamVideoClient();
    const [calls, setCalls] = useState<Call[]>();
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        const loadCalls = async () => {
            if (!client || !id) return;

            setIsLoading(true);

            try {
                const { calls } = await client.queryCalls({
                    sort: [{ field: "starts_at", direction: 1 }],
                    filter_conditions: {
                        starts_at: { $exists: true },
                        $or: [{ created_by_user_id: id }, { members: { $in: [id] } }],
                    },
                });

                setCalls(calls);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCalls();
    }, [client, id]);

    const now = new Date();
    //👇🏻 upcoming calls
    const upcomingCalls = calls?.filter(({ state: { startsAt } }: Call) => {
        return startsAt && new Date(startsAt) > now;
    });
    //👇🏻 ongoing calls
    const ongoingCalls = calls?.filter(
        ({ state: { startsAt, endedAt } }: Call) => {
            return startsAt && new Date(startsAt) < now && !endedAt;
        }
    );

    return { upcomingCalls, isLoading, ongoingCalls };
};