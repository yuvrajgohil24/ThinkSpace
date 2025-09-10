import Image from "next/image";

export const Loading = () => {
    return (
        <div className="h-[100vh] w-full flex flex-col justify-center items-center">
            <Image
                src={"/logo.svg"}
                alt="Logo"
                width={250}
                height={250}
                className="animate-pulse duration-700"
            />
        </div>
    )
}