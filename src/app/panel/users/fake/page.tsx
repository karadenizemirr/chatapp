import FakeUserContainer from "@/containers/FakeUserContainer";

export default function FakeUserPage(){
    return (
        <div className="container py-6 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <FakeUserContainer />
            </div>
        </div>
    )
}