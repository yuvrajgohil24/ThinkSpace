import { Canvas } from "./_components/canvas"
import { Room } from "@/components/room";
import { CanvasLoader } from "./_components/canvas-loader";

interface SpaceIdPageProps {
    params: {
        spaceId: string;
    };
};

const SpaceIdPage = async ({ params }: SpaceIdPageProps) => {
    const { spaceId } = await params;
    return (
        <Room roomId={spaceId} fallback={<CanvasLoader />}>
            <Canvas spaceId={spaceId} />
        </Room>
    )
}

export default SpaceIdPage