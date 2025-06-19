import FakeUserContainer from "@/containers/FakeUserContainer";

export default function FakeUserPage(){
    return (
        <div className="container py-6 space-y-6">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Fake Kullanıcı Yönetimi</h1>
                <p className="text-gray-600">Sahte profilleri yönetin ve yeni sahte kullanıcılar oluşturun</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <FakeUserContainer />
            </div>
        </div>
    )
}