'use client';

interface NavBarProps {
    title: string,
}

export default function NavBar(props: NavBarProps) {
    return (
        <nav className="bg-violet-950">
            <div className="flex flex-wrap justify-between p-2">
                <span
                    className="font-extrabold text-xl text-white p-2 m-auto">
                    {props.title || 'Turn Games'}
                </span>
            </div>
        </nav>
    )
}