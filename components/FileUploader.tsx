import { useRef } from "react";
export default function FileUploader({ handleFile, className, text }: { handleFile: (file: File) => void, className?: string, text: string }) {
    // Create a reference to the hidden file input element
    const hiddenFileInput = useRef(null);

    // Programatically click the hidden file input element
    // when the Button component is clicked
    const handleClick = (event) => {
        console.log("handleClick")
        hiddenFileInput.current.click();
    };
    // Call a function (passed as a prop from the parent component)
    // to handle the user-selected file
    const handleChange = (event) => {
        const fileUploaded = event.target.files[0];
        console.log("handleChange", fileUploaded)
        handleFile(fileUploaded);
    };

    return <>
        <button className={className} onClick={handleClick}>
            {text}
        </button>
        <input
            type="file"
            onChange={handleChange}
            ref={hiddenFileInput}
            accept=".js"
            style={{ display: "none" }} // Make the file input element invisible
        />
    </>

};
