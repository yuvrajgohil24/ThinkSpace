import { Canvas } from "./_components/canvas"

interface SpaceIdPageProps {
    params: {
        spaceId: string;
    };
};

const SpaceIdPage = ({ params }: SpaceIdPageProps) => {
    return (
        <Canvas spaceId={params.spaceId} />
    )
}

export default SpaceIdPage