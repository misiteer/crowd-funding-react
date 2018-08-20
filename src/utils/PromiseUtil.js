const PromiseForEach = async(objects, asyncDosometing) => {
    let result = [];
    for (let key in objects) {
        try {
            result.push(await asyncDosometing(objects[key]));
        } catch (err) {
            throw err;
        }
    }
    return result;
};

export {PromiseForEach}