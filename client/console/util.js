//
// Utility functions for Tapp-cs client
//

//
// test two polygons for equality, elements
// must be in same order in both arrays
//
define(function() {

    var epsilon = 0.0000000000001;

    //
    // Test two real numbers are equal within tolerance of epsilon
    //
    function equality(f1, f2, epsilon) {
        return Math.abs(f1 - f2) < epsilon;
    }

    function polygonsEqual(a, b) {

        if (a === b) return true;
        if (a === null || b === null) return false;
        if (a.length != b.length) return false;

        for (var i = 0; i < a.length; ++i) {
            if (!equality(a[i][0], b[i][0], epsilon)) return false;
            if (!equality(a[i][1], b[i][1], epsilon)) return false;
        }
        return true;
    }

    function objectsEqual(a, b) {
        var k1 = Object.keys(a).sort();
        var k2 = Object.keys(b).sort();
        if (a.length != b.length) return false;
        for (var i = 0; i < k1.length; ++i) {
            if(k1[i] !== k2[i]) return false;
            var at = typeof a[ k1[i]];
            var bt = typeof b[ k2[i]];
            if(typeof a[k1[i]] == "object" && typeof b[k2[i]] == "object"){
                if(!objectsEqual(a[k1[i]], b[k2[i]])) return false;
            } else {
                if(a[k1[i]] !== b[k2[i]]) return false;
            }
        }
        return true;
    }

    return {
        epsilon: epsilon,
        equality: equality,
        polygonsEqual: polygonsEqual,
        objectsEqual: objectsEqual,
        };
});
