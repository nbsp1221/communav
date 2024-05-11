import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function WritePage() {

    const contentPlaceholder = `에브리타임은 누구나 기분 좋게 참여할 수 있는 커뮤니티를 만들기 위해 커뮤니티 이용규칙을 제정하여 운영하고 있습니다. 위반 시 게시물이 삭제되고 서비스 이용이 일정 기간 제한될 수 있습니다.

아래는 이 게시판에 해당하는 핵심 내용에 대한 요약 사항이며, 게시물 작성 전 커뮤니티 이용규칙 전문을 반드시 확인하시기 바랍니다.

※ 정치·사회 관련 행위 금지
- 국가기관, 정치 관련 단체, 언론, 시민단체에 대한 언급 혹은 이와 관련한 행위
- 정책·외교 또는 정치·정파에 대한 의견, 주장 및 이념, 가치관을 드러내는 행위
- 성별, 종교, 인종, 출신, 지역, 직업, 이념 등 사회적 이슈에 대한 언급 혹은 이와 관련한 행위
- 위와 같은 내용으로 유추될 수 있는 비유, 은어 사용 행위    
* 해당 게시물은 시사·이슈 게시판에만 작성 가능합니다.
    
※ 홍보 및 판매 관련 행위 금지
- 영리 여부와 관계 없이 사업체·기관·단체·개인에게 직간접적으로 영향을 줄 수 있는 게시물 작성 행위    
- 위와 관련된 것으로 의심되거나 예상될 수 있는 바이럴 홍보 및 명칭·단어 언급 행위
* 해당 게시물은 홍보게시판에만 작성 가능합니다.
    
※ 불법촬영물 유통 금지
불법촬영물등을 게재할 경우 전기통신사업법에 따라 삭제 조치 및 서비스 이용이 영구적으로 제한될 수 있으며 관련 법률에 따라 처벌받을 수 있습니다.

※ 그 밖의 규칙 위반
- 타인의 권리를 침해하거나 불쾌감을 주는 행위
- 범죄, 불법 행위 등 법령을 위반하는 행위
- 욕설, 비하, 차별, 혐오, 자살, 폭력 관련 내용을 포함한 게시물 작성 행위
- 음란물, 성적 수치심을 유발하는 행위
- 스포일러, 공포, 속임, 놀라게 하는 행위
    `

    return (
        <div>
            <nav className="bg-gray-800">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <a href="/" className="text-white text-2xl font-bold">커뮤니티</a>
                        </div>
                        <div className="flex space-x-4">
                            <a href="/labeling" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">라벨링</a>
                            <a href="/statistics" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">통계</a>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto py-8 flex flex-col gap-2">
                <div className="p-5 border border-input">
                    <p className="text-3xl font-bold text-neutral-800">자유게시판</p>
                </div>

                <div className="border border-input flex flex-col">
                    <input className="p-4 border-b border-input text-xl placeholder:font-semibold font-semibold outline-none" placeholder="글 제목"></input>
                    <div className="p-4 border-b border-input w-full">
                        <textarea className="resize-none h-[500px] outline-none w-full" placeholder={contentPlaceholder} ></textarea>
                    </div>
                    <div className="flex justify-between items-center pl-4">
                        <div className="flex">
                            <Button size="icon" variant="ghost">
                                <img className="w-6" src="/icon-tag.svg" />
                            </Button>
                            <Button size="icon" variant="ghost">
                                <img className="w-6" src="/icon-file.svg" />
                            </Button>
                        </div>

                        <div className="flex gap-8">
                            <div className="flex items-center gap-3">
                                <Checkbox id="is-question"></Checkbox>
                                <Label htmlFor="is-question">질문</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Checkbox id="is-bline"></Checkbox>
                                <Label htmlFor="is-bline">익명</Label>
                            </div>
                            <Button className="w-12 p-0 h-12">
                                <img className="w-8 h-8" src="/icon-write.svg" />
                            </Button>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}