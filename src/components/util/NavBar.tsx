
interface NavBarProps {
    title: string,
}

export default function NavBar(props: NavBarProps) {
    return (
        <nav className="bg-gray-700">
            <div className="max-w-screen-xl flex flex-wrap justify-between p-2">
                <span
                    className="font-mono font-extrabold border-2 border-solid text-xl text-white p-2">
                    {props.title || 'Turn Games'}
                </span>
            </div>

        </nav>
    )
}